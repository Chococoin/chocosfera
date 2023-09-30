import React from 'react';
import { Description } from '@/components/Pages/Description/Description';
import { Header } from '@/components/Layout/Header/Header';
import { Marquee } from '@/components/Layout/Marquee/Marquee';
import { Information } from '@/components/Pages/Information/Information';
import { Contact } from '@/components/Pages/Contact/Contact';
import { Crypto } from '@/components/Pages/Crypto/Crypto';

export default function Home() {
    return (
        <div className='layout'>
            <Header />
            <Marquee />
            <Description />
            <Information />
            <Contact />
            <Crypto />
        </div>
    );
}
