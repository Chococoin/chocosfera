import React from 'react';
import classes from './Marquee.module.css';

export const Marquee = () => {
    return (
        <div className={classes['layout__marquee']}>
            <div className={classes['marquee__container--left']}>
                <div className={classes['marquee__status']}>
                    <p className={classes['status__text']}>Live &#9900;</p>
                </div>
                <div className={classes['marquee__episode']}>
                    <p className={classes['episode__text']}>Episode #01</p>
                </div>
                <div className={classes['marquee__place']}>
                    <p className={classes['place__text']}>Ecuador + Italy</p>
                </div>
                <div className={classes['marquee__time']}>
                    <p className={classes['time__text']}>01d 14h 39m 26s</p>
                </div>
            </div>
            <div className={classes['marquee__container--right']}>
                <div className={classes['marquee__users']}>
                    <p className={classes['users__text']}>
                        <span className={classes['users__text--online']}>
                            3271
                        </span>
                        /4000
                    </p>
                </div>
                <div className={classes['marque__extra']}>
                    <a href='#' className={classes['extra__link']}>
                        Mint Now
                    </a>
                </div>
            </div>
        </div>
    );
};
