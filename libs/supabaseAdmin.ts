import Stripe from 'stripe';
import { db } from './db';
import { stripe } from './stripe';
import { toDateTime } from './helpers';

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: (product.metadata as any) ?? null,
  };

  await db.product.upsert({
    where: { id: product.id },
    update: productData,
    create: productData,
  });

  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : null,
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: (price.metadata as any) ?? null,
  };

  await db.price.upsert({
    where: { id: price.id },
    update: priceData,
    create: priceData,
  });

  console.log(`Price inserted/updated: ${price.id}`);
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  const customerRecord = await db.customer.findUnique({
    where: { id: uuid },
  });

  if (customerRecord?.stripe_customer_id) {
    return customerRecord.stripe_customer_id;
  }

  const customerData: { metadata: { supabaseUUID: string }; email?: string } = {
    metadata: {
      supabaseUUID: uuid,
    },
  };
  if (email) customerData.email = email;

  const customer = await stripe.customers.create(customerData);

  await db.customer.create({
    data: {
      id: uuid,
      stripe_customer_id: customer.id,
    },
  });

  console.log(`New customer created and inserted for ${uuid}.`);
  return customer.id;
};

const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  
  await stripe.customers.update(customer, { name, phone, address: address as any });
  
  await db.user.update({
    where: { id: uuid },
    data: {
      billing_address: (address as any) || null,
      payment_method: (payment_method[payment_method.type] as any) || null,
    },
  });
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  const customerRecord = await db.customer.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (!customerRecord) throw new Error(`Customer record not found for Stripe customer: ${customerId}`);
  const uuid = customerRecord.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  const subscriptionData = {
    id: subscription.id,
    user_id: uuid,
    metadata: (subscription.metadata as any) ?? null,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: (subscription as any).quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? toDateTime(subscription.cancel_at) : null,
    canceled_at: subscription.canceled_at ? toDateTime(subscription.canceled_at) : null,
    current_period_start: toDateTime(subscription.current_period_start),
    current_period_end: toDateTime(subscription.current_period_end),
    created: toDateTime(subscription.created),
    ended_at: subscription.ended_at ? toDateTime(subscription.ended_at) : null,
    trial_start: subscription.trial_start ? toDateTime(subscription.trial_start) : null,
    trial_end: subscription.trial_end ? toDateTime(subscription.trial_end) : null,
  };

  await db.subscription.upsert({
    where: { id: subscription.id },
    update: subscriptionData,
    create: subscriptionData,
  });

  console.log(`Inserted/updated subscription [${subscription.id}] for user [${uuid}]`);

  if (createAction && subscription.default_payment_method && uuid) {
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
};
