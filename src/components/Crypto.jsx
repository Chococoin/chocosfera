import React from 'react';

export const Crypto = () => {
    return (
        <section className='layout__crypto'>
            <div className='crypto__container'>
                <div className='ecosystem__top'>
                    <h1 className='ecosystem__title'>
                        L'ecosistema green-tech di Chocosfera
                    </h1>
                </div>
                <div className='ecosystem__middle'>
                    <div className='middle__left-cryto'>
                        <div className='left-crypto__information'>
                            <h2 className='left-cryto__title'>Proof-of-tree</h2>
                            <p className='left-crypto__description'>
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Praesentium placeat enim
                                voluptates repellat perspiciatis architecto
                                eligendi odio ipsa nihil, voluptas doloribus
                                explicabo, aspernatur ipsum deleniti commodi,
                                rem laborum cum? Eius.
                            </p>
                            <div className='left-crypto__image'>
                                <img
                                    src='https://placehold.co/250x50'
                                    alt='polygon'
                                    className='left-crypto__image--crypto'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='middle__right-crypto'>
                        <div className='right-crypto__top'>
                            <h2 className='right-crypto__title'>SuperChoco$</h2>
                            <p className='right-crypto__description'>
                                Lorem ipsum dolor, sit amet consectetur
                                adipisicing elit. Incidunt nisi, facilis, sunt
                                id mollitia et non voluptatibus at sed qui
                                laborum, optio nesciunt dolores voluptates.
                                Ipsum, mollitia blanditiis! Nobis, minima.
                            </p>
                        </div>
                        <div className='right-crypto__bottom'>
                            <h2 className='right-crypto__title'>
                                Block-to-bar
                            </h2>
                            <p className='right-crypto__description'>
                                Lorem ipsum dolor sit, amet consectetur
                                adipisicing elit. Maxime culpa illo veniam dolor
                                sit libero facere delectus tempora voluptas
                                ipsam, ipsum fugit fuga facilis sed reiciendis
                                quibusdam odio suscipit odit.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='ecosystem__bottom'>
                    <a href='#' className='ecosystem__button'>
                        Adotta subito la tua pianta
                    </a>
                </div>
            </div>
        </section>
    );
};
