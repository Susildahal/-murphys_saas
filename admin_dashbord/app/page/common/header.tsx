"use client";
import React from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {ArrowLeft} from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
  link?: string;
  linkText?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  onButtonClick?: () => void;
  extra?: React.ReactNode;
  // legacy/alternate prop name used in some pages
  extraInfo?: React.ReactNode;
  total?: number;

}

const onClick = (event: React.MouseEvent) => 
  {
    event.preventDefault();
    window.history.back();
  };
function Header({ title , description , link, linkText, buttonText, icon, onButtonClick  , extra, extraInfo , total , }: HeaderProps) {
  return (
   <div className=" flex justify-between items-center mb-2 ">
    <div className=' flex gap-2 items-center'>
     <ArrowLeft className="cursor-pointer" onClick={onClick} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           
            <div>
              <CardTitle className="text-xl font-bold">
                {title}
                {typeof total === 'number' ? ` — Total: ${total}` : ''}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {description}
              </CardDescription>
            </div>
            </div>
               </div>

        <div className=' flex gap-4 items-center'>
         
          {extra ?? extraInfo}
         
        { (link || onButtonClick) && (
          <div  className=' flex gap-2 items-center'>
            {link ? (
              <a href={link}>
                <Button className="">
                  {icon && <span className="h-4 w-4 mr-2">{icon}</span>}
                  {buttonText || linkText}
                </Button>
              </a>
            ) : (
              <Button onClick={onButtonClick} className="">
                {icon && <span className="h-4 w-4 mr-2">{icon}</span>}
                {buttonText || linkText}
              </Button>
            )}
          </div>
        )}
              </div>


         
          
          
        </div>
        
  )
}

export default Header