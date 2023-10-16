import React from 'react';
import Image from 'next/image';
import logo from '../../../app/assets/images/logo.png';
import classes from './Footer.module.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

export const Footer = () => {
    return (
        <footer className={classes['layout__footer']}>
            <div className={classes['footer__information']}>
                <div className='information__logo'>
                    <Image
                        src={logo}
                        alt='soulbot logo'
                        className={classes['information__logo--image']}
                    />
                </div>
                <div className={classes['information__description']}>
                    <p className={classes['description__text']}>
                        L'ecosistema decentralizzato basato sulla filiera del
                        cioccolato
                    </p>
                </div>
                <div className={classes['information__social']}>
                    <div className={classes['social__icon']}>
                        <a href='#' className={classes['icon__link']}>
                            <FontAwesomeIcon
                                icon={faInstagram}
                                style={{ fontSize: 50, color: 'black' }}
                            />
                        </a>
                    </div>
                    <div className={classes['social__icon']}>
                        <a href='#' className={classes['icon__link']}>
                            <FontAwesomeIcon
                                icon={faTelegram}
                                style={{ fontSize: 50, color: 'black' }}
                            />
                        </a>
                    </div>
                    <div className={classes['social__icon']}>
                        <a href='#' className={classes['icon__link']}>
                            <FontAwesomeIcon
                                icon={faFacebook}
                                style={{ fontSize: 50, color: 'black' }}
                            />
                        </a>
                    </div>
                    <div className={classes['social__icon']}>
                        <a href='#' className={classes['icon__link']}>
                            <FontAwesomeIcon
                                icon={faTwitter}
                                style={{ fontSize: 50, color: 'black' }}
                            />
                        </a>
                    </div>
                </div>
                <div className={classes['information__privacy']}>
                    <div className={classes['privacy__conditions']}>
                        <a href='#' className={classes['conditions__link']}>
                            Termine e condizioni
                        </a>
                    </div>
                    -
                    <div className={classes['privacy__conditions']}>
                        <a href='#' className={classes['policy__link']}>
                            Privacy policy
                        </a>
                    </div>
                    -
                    <div className={classes['privacy__conditions']}>
                        <a href='#' className={classes['cookie__link']}>
                            Cookie policy
                        </a>
                    </div>
                </div>
                <div className={classes['information__copyright']}>
                    <p className={classes['copyright__information']}>
                        Copyright &copy; Chocosfera SRL 2023. All rights reserve
                        - P.IVA 09843280968
                    </p>
                </div>
            </div>
        </footer>
    );
};
