"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { ClipLoader } from 'react-spinners';

const AuthModal = () => {
  const router = useRouter();
  const { onClose, isOpen } = useAuthModal();
  const { user, login, registerUser, isLoading } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      onClose();
      router.refresh();
    }
  }, [user, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        onClose();
      }
    } else {
      const success = await registerUser(email, password, fullName);
      if (success) {
        onClose();
      }
    }
  }

  return (
    <Modal 
      title={isLogin ? "Welcome back" : "Create your account"} 
      description={isLogin ? "Login to your Spotify account." : "Sign up to start listening."} 
      isOpen={isOpen} 
      onChange={onChange} 
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 mt-2">
        {!isLogin && (
          <Input
            id="fullName"
            disabled={isLoading}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
          />
        )}
        <Input
          id="email"
          type="email"
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
        <Input
          id="password"
          type="password"
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <Button disabled={isLoading} type="submit" className="bg-green-500 text-black font-semibold hover:bg-green-400 py-3 transition mt-2">
          {isLoading ? <ClipLoader color="#000000" size={20} /> : (isLogin ? "Log In" : "Sign Up")}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-400 hover:text-white text-xs underline underline-offset-4 transition"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AuthModal;