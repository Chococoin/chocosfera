import React from 'react';
import Image from 'next/image';
import classes from './Partners.module.css';
import photo from '../../../app/assets/images/logo.png';

export const Partners = () => {
    return (
        <section className={classes['layout__partners']}>
            <div className={classes['partners__container']}>
                <div className={classes['container__top']}>
                    <h2 className={classes['top__title']}>
                        Cosa pensano partner e member della community
                    </h2>
                </div>
                <div className={classes['container__middle']}>
                    <article className={classes['middle_customers']}>
                        <p className={classes['customers__info']}>
                            Un progetto pazzesco e anche una cosa buona per
                            l'ambiente. Complimenti al team super efficiente di
                            Chocosfera!
                        </p>
                        <div className={classes['customers__photo']}>
                            <div className={classes['photo__container']}>
                                <Image
                                    src={photo}
                                    className={
                                        classes['customers__photo--image']
                                    }
                                    alt='user'
                                />
                            </div>
                            <div className={classes['photo__data']}>
                                <h3 className={classes['data__name']}>
                                    Rodrigo Becao
                                </h3>
                                <p className={classes['data_description']}>
                                    sceriffo in pensione
                                </p>
                            </div>
                        </div>
                    </article>
                    <article className={classes['middle_customers']}>
                        <p className={classes['customers__info']}>
                            Un progetto pazzesco e anche una cosa buona per
                            l'ambiente. Complimenti al team super efficiente di
                            Chocosfera!
                        </p>
                        <div className={classes['customers__photo']}>
                            <div className={classes['photo__container']}>
                                <Image
                                    src={photo}
                                    className={
                                        classes['customers__photo--image']
                                    }
                                    alt='user'
                                />
                            </div>
                            <div className={classes['photo__data']}>
                                <h3 className={classes['data__name']}>
                                    Rodrigo Becao
                                </h3>
                                <p className={classes['data_description']}>
                                    sceriffo in pensione
                                </p>
                            </div>
                        </div>
                    </article>
                    <article className={classes['middle_customers']}>
                        <p className={classes['customers__info']}>
                            Un progetto pazzesco e anche una cosa buona per
                            l'ambiente. Complimenti al team super efficiente di
                            Chocosfera!
                        </p>
                        <div className={classes['customers__photo']}>
                            <div className={classes['photo__container']}>
                                <Image
                                    src={photo}
                                    className={
                                        classes['customers__photo--image']
                                    }
                                    alt='user'
                                />
                            </div>
                            <div className={classes['photo__data']}>
                                <h3 className={classes['data__name']}>
                                    Rodrigo Becao
                                </h3>
                                <p className={classes['data_description']}>
                                    sceriffo in pensione
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
                <div className={classes['container__bottom']}>
                    <a href='#' className={classes['bottom__button']}>
                        entra nella nostra community solidale
                    </a>
                </div>
            </div>
        </section>
    );
};
