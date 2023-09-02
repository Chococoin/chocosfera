import React from 'react';

export const Header = () => (
    <nav className='layout__menu'>
        <div className='menu__logo'>
            <img src='' alt='chocosfera logo' />
        </div>
        <ul className='menu__list'>
            <li className='menu__option'>
                <a href='#' className='menu__link menu__link--active'>
                    <span className='menu__text'>Project</span>
                </a>
            </li>
            <li className='menu__option menu__link--divider'>
                <a href='#' className='menu__link '>
                    <span className='menu__text'>Episodes</span>
                </a>
            </li>
            <li className='menu__option'>
                <a href='#' className='menu__link'>
                    <span className='menu__text'>Choco-Store</span>
                </a>
            </li>
        </ul>
        <div className='menu__language'>
            <a href='#' className='language_item language__first'>
                it
            </a>
            <a href='#' className='language_item language__second'>
                en
            </a>
        </div>
        <div className='menu__wallet'>
            <a href='#' className='wallet__button'>
                connect wallet
            </a>
        </div>
    </nav>
);
