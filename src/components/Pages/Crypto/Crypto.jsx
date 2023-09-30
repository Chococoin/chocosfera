import React from 'react';
import Image from 'next/image';
import classes from './Crypto.module.css';
import imgOne from '../../../app/assets/images/polygon_logo-freelogovectors.net_-640x400.png';

export const Crypto = () => {
    return (
        <section className={classes['layout__crypto']}>
            <div className={classes['crypto__container']}>
                <div className={classes['ecosystem__top']}>
                    <h1 className={classes['ecosystem__title']}>
                        L'ecosistema green-tech di Chocosfera
                    </h1>
                </div>
                <div className={classes['ecosystem__middle']}>
                    <div className={classes['middle__left-cryto']}>
                        <div className={classes['left-crypto__information']}>
                            <h2 className={classes['left-cryto__title']}>
                                Proof-of-tree
                            </h2>
                            <p className={classes['left-crypto__description']}>
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Praesentium placeat enim
                                voluptates repellat perspiciatis architecto
                                eligendi odio ipsa nihil, voluptas doloribus
                                explicabo, aspernatur ipsum deleniti commodi,
                                rem laborum cum? Eius.
                            </p>
                            <div className={classes['left-crypto__image']}>
                                <Image
                                    src={imgOne}
                                    alt='polygon'
                                    className={
                                        classes['left-crypto__image--crypto']
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className={classes['middle__right-crypto']}>
                        <div className={classes['right-crypto__top']}>
                            <h2 className={classes['right-crypto__title']}>
                                SuperChoco$
                            </h2>
                            <p className={classes['right-crypto__description']}>
                                Lorem ipsum dolor, sit amet consectetur
                                adipisicing elit. Incidunt nisi, facilis, sunt
                                id mollitia et non voluptatibus at sed qui
                                laborum, optio nesciunt dolores voluptates.
                                Ipsum, mollitia blanditiis! Nobis, minima.
                            </p>
                        </div>
                        <div className={classes['right-crypto__bottom']}>
                            <h2 className={classes['right-crypto__title']}>
                                Block-to-bar
                            </h2>
                            <p className={classes['right-crypto__description']}>
                                Lorem ipsum dolor sit, amet consectetur
                                adipisicing elit. Maxime culpa illo veniam dolor
                                sit libero facere delectus tempora voluptas
                                ipsam, ipsum fugit fuga facilis sed reiciendis
                                quibusdam odio suscipit odit.
                            </p>
                        </div>
                    </div>
                </div>
                <div className={classes['ecosystem__bottom']}>
                    <a href='#' className={classes['ecosystem__button']}>
                        Adotta subito la tua pianta
                    </a>
                </div>
            </div>
        </section>
    );
};
