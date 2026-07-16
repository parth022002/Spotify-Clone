import Header from "@/components/Header";

import AccountContent from "./components/AccountContent";

const Account = () => {
  return (
    <div 
      className="
        bg-neutral-950/65 
        backdrop-blur-xl 
        border 
        border-neutral-800/40 
        rounded-2xl 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
        shadow-2xl
      "
    >
      <Header className="from-neutral-950/40">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">
            Account Settings
          </h1>
        </div>
      </Header>
      <AccountContent />
    </div>
  )
}

export default Account;
