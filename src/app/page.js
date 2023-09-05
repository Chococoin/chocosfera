import React from 'react';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';
import { Description } from '@/components/Description';
import { Information } from '@/components/Information';
import { Contact } from '@/components/Contact';

export default function Home() {
    return (
        <div className='layout'>
            <Header />
            <Marquee />
            <Description />
            <Information />
            <Contact />
        </div>
    );
}
