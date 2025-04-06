'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GratitudeInput from './GratitudeInput';
import GratitudeView from './GratitudeView';

export default function GratitudesPage() {
  const [activeTab, setActiveTab] = useState<'input' | 'view'>('input');

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Gratitudes</h1>
      <div className="glass-card p-4 sm:p-6">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="view">View</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <GratitudeInput />
          </TabsContent>
          <TabsContent value="view">
            <GratitudeView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 