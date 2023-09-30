import React from 'react';
import Image from 'next/image';
import classes from './Header.module.css';
import logo from '../../../app/assets/images/logo.png';

export const Header = () => {
    return (
        <header className={classes['layout__menu']}>
            <nav className={classes['menu__navbar']}>
                <div className={classes['navbar__logo']}>
                    <Image
                        className={classes['navbar__logo--image']}
                        src={logo}
                        alt='chocosfera logo'
                    />
                </div>
                <ul className={classes['navbar__list']}>
                    <li className={classes['list__option']}>
                        <a
                            href='#'
                            className={`${classes['option__link']} ${classes['option__link--active']}`}
                        >
                            <span className={classes['option__text']}>
                                Project
                            </span>
                        </a>
                    </li>
                    <li
                        className={`${classes['list__option']} ${classes['list__option--divider']}`}
                    >
                        <a href='#' className={classes['option__link']}>
                            <span className={classes['option__text']}>
                                Episodes
                            </span>
                        </a>
                    </li>
                    <li className={classes['list__option']}>
                        <a href='#' className={classes['option__link']}>
                            <span className={classes['option__text']}>
                                Choco-Store
                            </span>
                        </a>
                    </li>
                </ul>
                <div className={classes['navbar__language']}>
                    <a
                        href='#'
                        className={`${classes['language__item']} ${classes['language__first']}`}
                    >
                        it
                    </a>
                    <a
                        href='#'
                        className={`${classes['language__item']} ${classes['language__second']}`}
                    >
                        en
                    </a>
                </div>
                <div className={classes['navbar__wallet']}>
                    <a href='#' className={classes['wallet__button']}>
                        connect wallet
                    </a>
                </div>
            </nav>
        </header>
    );
};
