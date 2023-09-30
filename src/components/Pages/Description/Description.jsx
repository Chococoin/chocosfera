import React from 'react';
import Image from 'next/image';
import classes from './Description.module.css';
import imgOne from '../../../app/assets/images/cocoa NFT.png';
import imgTwo from '../../../app/assets/images/cocoa-bean.png';
import imgThree from '../../../app/assets/images/reward.png';
import imgFour from '../../../app/assets/images/arrow.png';
import imgFive from '../../../app/assets/images/cocoa-tree.png';

export const Description = () => {
    return (
        <section className={classes['layout__description']}>
            <div className={classes['description__container']}>
                <div className={classes['container__information']}>
                    <div className={classes['information__left']}>
                        <h1 className={classes['left__title']}>
                            Adotta e coltiva una vera pianta di cacao tramite la
                            blockchain
                        </h1>
                        <p className={classes['left__description']}>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Aperiam similique deserunt omnis corporis
                            delectus ex architecto rerum deleniti minima iste
                            optio, quasi fugiat provident perferendis laudantium
                            error dicta perspiciatis accusamus.
                        </p>
                        <a href='#' className={classes['left__button']}>
                            Adotta Subito
                        </a>
                    </div>
                    <div className={classes['information__right']}>
                        <Image
                            className={classes['right__image']}
                            src={imgFive}
                            alt='cocoa tree'
                        />
                    </div>
                </div>

                <div className={classes['container__function']}>
                    <div className={classes['function__top']}>
                        <h2 className={classes['top__title']}>Come funziona</h2>
                        <p className={classes['top__description']}>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Modi, nisi! Consectetur enim odio eaque
                            repellat beatae ipsam quae illo fugiat optio error
                            mollitia numquam, provident harum sunt consequatur
                            ab in. Lorem ipsum dolor sit amet consectetur
                            adipisicing elit. Temporibus nisi, alias nulla
                            tempora eius blanditiis doloribus officia aliquid
                            odit quasi aperiam veniam, voluptas fugit suscipit
                            sequi ipsam, non unde corrupti.
                        </p>
                    </div>
                    <div className={classes['function__bottom']}>
                        <div className={classes['bottom__article']}>
                            <div className={classes['bottom__image']}>
                                <Image
                                    src={imgOne}
                                    alt='cocoa nft'
                                    className={classes['bottom__image--icon']}
                                />
                            </div>

                            <p className={classes['bottom__image--title']}>
                                adotta una pianta
                            </p>

                            <p
                                className={
                                    classes['bottom__image--description']
                                }
                            >
                                (MINTING)
                            </p>
                        </div>

                        <div className={classes['bottom__article']}>
                            <Image
                                src={imgFour}
                                alt='arrow'
                                className={classes['bottom__image--arrow']}
                            />
                        </div>

                        <div className={classes['bottom__article']}>
                            <div className={classes['bottom__image']}>
                                <Image
                                    src={imgTwo}
                                    alt='cocoa bean'
                                    className={classes['bottom__image--icon']}
                                />
                            </div>
                            <p className={classes['bottom__image--title']}>
                                lasciala maturare
                            </p>
                            <p
                                className={
                                    classes['bottom__image--description']
                                }
                            >
                                (STAKING)
                            </p>
                        </div>

                        <div className={classes['bottom__article']}>
                            <Image
                                src={imgFour}
                                alt='arrow'
                                className={classes['bottom__image--arrow']}
                            />
                        </div>

                        <div className={classes['bottom__article']}>
                            <div className={classes['bottom__image']}>
                                <Image
                                    src={imgThree}
                                    alt='rewards'
                                    className={classes['bottom__image--icon']}
                                />
                            </div>
                            <p className={classes['bottom__image--title']}>
                                ricevi coins
                            </p>
                            <p
                                className={
                                    classes['bottom__image--description']
                                }
                            >
                                (REWARDS)
                            </p>
                        </div>
                    </div>

                    <div className={classes['function__button']}>
                        <a href='#' className={classes['button__function']}>
                            Scopri su Telegram
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
