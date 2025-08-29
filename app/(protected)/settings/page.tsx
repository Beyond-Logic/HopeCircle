import React from 'react'
import { Settings } from './_components';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Settings | HopeCircle",
};


export default function SettingsPage() {
  return <Settings/>;
}
