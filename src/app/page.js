import React from 'react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Description } from '@/components/Pages/Description/Description';
import { Header } from '@/components/Layout/Header/Header';
import { Marquee } from '@/components/Layout/Marquee/Marquee';
import { Information } from '@/components/Pages/Information/Information';
import { Contact } from '@/components/Pages/Contact/Contact';
import { Crypto } from '@/components/Pages/Crypto/Crypto';
import { Partners } from '@/components/Pages/Partners/Partners';
import { Footer } from '@/components/Layout/Footer/Footer';

export default function Home() {
    return (
        <div className='layout'>
            <Header />
            <Marquee />
            <Description />
            <Information />
            <Contact />
            <Crypto />
            <Partners />
            <Footer />
        </div>
    );
}
