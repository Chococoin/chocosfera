import React from 'react';
import Image from 'next/image';
import classes from './Information.module.css';
import imgOne from '../../../app/assets/images/tropical-rainforest-growth-surrounds-mountain-range-beauty-underwater-generated-by-ai.jpg';
import imgTwo from '../../../app/assets/images/landscape-hills-covered-greenery-surrounded-by-sea-cloudy-sky-during-sunset.jpg';
import imgThree from '../../../app/assets/images/landscape-tropical-green-forest.jpg';

export const Information = () => {
    return (
        <section className={classes['layout__information']}>
            <div className={classes['information__container']}>
                <div className={classes['container__explanation']}>
                    <h1 className={classes['explanation__title']}>
                        Perche Chocosfera
                    </h1>
                    <p className={classes['explanation__text']}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        At eius labore eveniet illum eligendi exercitationem
                        repellat, facere nisi assumenda quod cum excepturi
                        explicabo quos soluta suscipit expedita cumque dolor
                        amet?. Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Soluta, ea? Provident repudiandae
                        beatae, similique ipsum enim necessitatibus nisi commodi
                        quidem laudantium alias quo vel ipsam adipisci,
                        dignissimos doloribus veritatis facere!
                    </p>
                </div>

                <div className={classes['container__chocolate']}>
                    <article className={classes['chocolate__article']}>
                        <div className={classes['chocolate__image']}>
                            <Image
                                src={imgOne}
                                alt='chocolate'
                                className={classes['chocolate__image--display']}
                            />
                        </div>
                        <h2 className={classes['chocolate__title']}>
                            Salvaguardia dell'ambiente e del clima
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>

                    <article className={classes['chocolate__article']}>
                        <div className={classes['chocolate__image']}>
                            <Image
                                src={imgTwo}
                                alt='chocolate'
                                className={classes['chocolate__image--display']}
                            />
                        </div>
                        <h2 className={classes['chocolate__title']}>
                            Filiera tracciata e provenienza certificata
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>

                    <article className={classes['chocolate__article']}>
                        <div className={classes['chocolate__image']}>
                            <Image
                                src={imgThree}
                                alt='chocolate'
                                className={classes['chocolate__image--display']}
                            />
                        </div>
                        <h2 className={classes['chocolate__title']}>
                            Miglioramento condizioni di vita delle popolazioni
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>
                </div>
                <div className={classes['container__community']}>
                    <a href='#' className={classes['community__button']}>
                        Entra nella nostra community solidale
                    </a>
                </div>
            </div>
        </section>
    );
};
