import React from 'react';

export const Contact = () => {
    return (
        <section className='layout__contact'>
            <div className='contact__container'>
                <div className='container__more'>
                    <h2 className='more__title'>Vuoi Saperne di piu?</h2>
                    <p className='more__description'>
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
                <div className='container__contact'>
                    <div className='contact__telegram'>
                        <div className='telegram__image'>
                            <img
                                src='https://placehold.co/150'
                                alt='telegram'
                                className='telegram__image--display'
                            />
                        </div>
                        <div className='telegram__button'>
                            <a href='#' className='button__telegram'>
                                Apri chat telegram
                            </a>
                        </div>
                        <p className='telegram__info'>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit.
                        </p>
                    </div>

                    <div className='contact__email'>
                        <div className='email__container'>
                            <div className='email__image'>
                                <img
                                    src='https://placehold.co/120'
                                    alt='email'
                                    className='email__image--display'
                                />
                            </div>
                            <div className='email__information'>
                                <h2 className='email__title'>Scrivici a</h2>
                                <p className='email__email'>
                                    support@chocosfera.com
                                </p>
                            </div>
                        </div>

                        <div className='newsletter__container'>
                            <h2 className='newsletter__title'>
                                Iscrizione newsletter
                            </h2>

                            <div className='newsletter__form'>
                                <form className='form__form'>
                                    <input
                                        type='text'
                                        className='form__email'
                                        placeholder='La tua e-mail'
                                    />
                                    <button className='form__button'>
                                        iscriviti
                                    </button>
                                </form>
                            </div>

                            <p className='newsletter__confirm'>
                                Lorem ipsum dolor sit amet consectetur
                                <a
                                    href='#'
                                    className='newsletter__confirm--link'
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
