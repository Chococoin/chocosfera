import React from 'react';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';

export default function Home() {
    return (
        <div className='layout'>
            <Header />
            <Marquee />
        </div>
    );
}
