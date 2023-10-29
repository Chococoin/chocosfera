import React from 'react';
import Image from 'next/image';
import classes from './Contact.module.css';
import imgOne from '../../../app/assets/images/teleczz.jpeg';
import imgTwo from '../../../app/assets/images/emmail.png';

export const Contact = () => {
    return (
        <section className={classes['layout__contact']}>
            <div className={classes['contact__container']}>
                <div className={classes['container__more']}>
                    <h2 className={classes['more__title']}>
                        Vuoi Saperne di piu?
                    </h2>
                    <p className={classes['more__description']}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Quae iure a, quibusdam suscipit dolore similique
                        laborum fugiat perferendis? Praesentium nobis labore
                        sequi, totam cumque voluptatem modi commodi eius qui
                        rerum! Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Corrupti vitae voluptatem assumenda
                        consectetur reprehenderit explicabo vel qui sint! Vitae,
                        unde excepturi aliquam placeat facilis cupiditate quia
                        architecto ratione quo sunt.
                    </p>
                </div>
                <div className={classes['container__contact']}>
                    <div className={classes['contact__telegram']}>
                        <div className={classes['telegram__image']}>
                            <Image
                                src={imgOne}
                                alt='telegram'
                                className={classes['telegram__image--display']}
                            />
                        </div>
                        <div className={classes['telegram__button']}>
                            <a href='#' className={classes['button__telegram']}>
                                Apri chat telegram
                            </a>
                        </div>
                        <p className={classes['telegram__info']}>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit.
                        </p>
                    </div>

                    <div className={classes['contact__email']}>
                        <div className={classes['email__container']}>
                            <div className={classes['email__image']}>
                                <Image
                                    src={imgTwo}
                                    alt='email'
                                    className={classes['email__image--display']}
                                />
                            </div>
                            <div className={classes['email__information']}>
                                <h2 className={classes['email__title']}>
                                    Scrivici a
                                </h2>
                                <p className={classes['email__email']}>
                                    support@chocosfera.com
                                </p>
                            </div>
                        </div>

                        <div className={classes['newsletter__container']}>
                            <h2 className={classes['newsletter__title']}>
                                Iscrizione newsletter
                            </h2>

                            <div className={classes['newsletter__form']}>
                                <form className={classes['form__form']}>
                                    <input
                                        type='text'
                                        className={classes['form__email']}
                                        placeholder='La tua e-mail'
                                    />
                                    <button className={classes['form__button']}>
                                        iscriviti
                                    </button>
                                </form>
                            </div>

                            <p className={classes['newsletter__confirm']}>
                                Lorem ipsum dolor sit amet consectetur
                                <a
                                    href='#'
                                    className={
                                        classes['newsletter__confirm--link']
                                    }
                                >
                                    adipisicing elit
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
