import React from 'react';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';
import { Description } from '@/components/Description';

export default function Home() {
    return (
        <div className='layout'>
            <Header />
            <Marquee />
            <Description />
        </div>
    );
}
