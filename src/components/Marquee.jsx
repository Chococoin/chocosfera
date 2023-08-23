import React from 'react';

export const Marquee = () => {
    return (
        <div className='layout__marquee'>
            <div className='marquee__container--left'>
                <div className='marquee__status'>
                    <p className='status__text'>Live &#9900;</p>
                </div>
                <div className='marquee__episode'>
                    <p className='episode__text'>Episode #01</p>
                </div>
                <div className='marquee__place'>
                    <p className='place__text'>Ecuador + Italy</p>
                </div>
                <div className='marquee__time'>
                    <p className='time__text'>01d 14h 39m 26x</p>
                </div>
            </div>
            <div className='marquee__container--right'>
                <div className='marquee__users'>
                    <p className='users__text'>
                        <span className='users__text--online'>3271</span>/4000
                    </p>
                </div>
                <div className='marque__extra'>
                    <a href='#' className='extra__link'>
                        Mint Now
                    </a>
                </div>
            </div>
        </div>
    );
};
