import React from 'react';
import { Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-light px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-darkest">Microservices Architecture</h1>
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-neutral-medium hover:bg-neutral-lightest hover:text-neutral-dark">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-1 rounded-full text-neutral-medium hover:bg-neutral-lightest hover:text-neutral-dark">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="relative">
            <button className="flex items-center text-sm font-medium text-neutral-dark">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="ml-1">Admin</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
