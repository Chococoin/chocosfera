import React from 'react';

export const Information = () => {
    return (
        <section className='layout__information'>
            <div className='information__container'>
                <div className='container__explanation'>
                    <h1 className='explanation__title'>Perche Chocosfera</h1>
                    <p className='explanation__text'>
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

                <div className='container__chocolate'>
                    <article className='chocolate__article'>
                        <div className='chocolate__image'>
                            <img
                                src='https://placehold.co/250'
                                alt='chocolate'
                                className='chocolate__image--display'
                            />
                        </div>
                        <h2 className='chocolate__title'>
                            Salvaguardia dell'ambiente e del clima
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>

                    <article className='chocolate__article'>
                        <div className='chocolate__image'>
                            <img
                                src='https://placehold.co/250'
                                alt='chocolate'
                                className='chocolate__image--display'
                            />
                        </div>
                        <h2 className='chocolate__title'>
                            Filiera tracciata e provenienza certificata
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>

                    <article className='chocolate__article'>
                        <div className='chocolate__image'>
                            <img
                                src='https://placehold.co/250'
                                alt='chocolate'
                                className='chocolate__image--display'
                            />
                        </div>
                        <h2 className='chocolate__title'>
                            Miglioramento condizioni di vita delle popolazioni
                        </h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing
                            elit. Eligendi recusandae ipsam assumenda
                            temporibus.
                        </p>
                    </article>
                </div>
                <div className='container__community'>
                    <a href='#' className='community__button'>
                        Entra nella nostra community solidale
                    </a>
                </div>
            </div>
        </section>
    );
};
