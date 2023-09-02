import React from 'react';

export const Description = () => {
    return (
        <section className='layout__description'>
            <div className='description__container'>
                <div className='container__information'>
                    <div className='information__left'>
                        <h1 className='left__title'>
                            Adotta e coltiva una vera pianta di cacao tramite la
                            blockchain
                        </h1>
                        <p className='left__description'>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Aperiam similique deserunt omnis corporis
                            delectus ex architecto rerum deleniti minima iste
                            optio, quasi fugiat provident perferendis laudantium
                            error dicta perspiciatis accusamus.
                        </p>
                        <a href='#' className='left__button'>
                            Adotta Subito
                        </a>
                    </div>
                    <div className='information__right'>
                        <img className='right__image' src='#' alt=''></img>
                    </div>
                </div>

                <div className='container__function'>
                    <div className='function__top'>
                        <h2 className='top__title'>Come funziona</h2>
                        <p className='top__description'>
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
                    <div className='function__bottom'>
                        <div className='bottom__article'>
                            <div className='bottom__image'>
                                <img
                                    src='#'
                                    alt=''
                                    className='bottom__image--icon'
                                />
                            </div>

                            <p className='bottom__image--title'>
                                adotta una pianta
                            </p>

                            <p className='bottom__image--description'>
                                (MINTING)
                            </p>
                        </div>

                        <div className='bottom__article'>
                            <div className='bottom__image'>
                                <img
                                    src='#'
                                    alt=''
                                    className='bottom__image--icon'
                                />
                            </div>
                            <p className='bottom__image--title'>
                                lasciala maturare
                            </p>
                            <p className='bottom__image--description'>
                                (STAKING)
                            </p>
                        </div>

                        <div className='bottom__article'>
                            <div className='bottom__image'>
                                <img
                                    src='#'
                                    alt=''
                                    className='bottom__image--icon'
                                />
                            </div>
                            <p className='bottom__image--title'>ricevi coins</p>
                            <p className='bottom__image--description'>
                                (REWARDS)
                            </p>
                        </div>
                    </div>

                    <div className='function__button'>
                        <a href='' className='button__function'>
                            Scopri su Telegram
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
