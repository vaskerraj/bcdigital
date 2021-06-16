import React from 'react';
import Link from 'next/link';

const MobileMenuDrawer = ({ categories, cateogoriesList, mobileMenuVisibleHandler, mobileMenuVisible, showSubmenHandler }) => {
    return (
        <>
            <div className="offcanvas-overlay" onClick={() => mobileMenuVisibleHandler(false)} style={{ display: !mobileMenuVisible ? "none" : "block" }}></div>
            <div id="offcanvas-mobile-menu" className={`offcanvas offcanvas-mobile-menu ${!mobileMenuVisible ? "" : "offcanvas-open"} `}>
                <div className="inner">
                    <div className="border-bottom mb-4 pb-4 text-right">
                        <button className="offcanvas-close" onClick={() => mobileMenuVisibleHandler(false)}>×</button>
                    </div>
                    {cateogoriesList &&
                        <nav className="offcanvas-menu">
                            <ul>
                                {categories.map(mainCat => (
                                    <li key={mainCat._id} onClick={(e) => showSubmenHandler(e)}>
                                        {mainCat.children.length !== 0 && <span className="menu-expand"></span>}
                                        {mainCat.children.length !== 0 ?
                                            (
                                                <a><span className="menu-text">{mainCat.name}</span></a>
                                            ) :
                                            (
                                                <Link href={`/search?q=${subCat.slug}&type=cat`}>
                                                    <a><span className="menu-text">{subCat.name}</span></a>
                                                </Link>
                                            )
                                        }
                                        {
                                            mainCat.children.length !== 0 &&
                                            <ul className="offcanvas-submenu">
                                                {mainCat.children.map(subCat => (
                                                    <li key={subCat._id} onClick={(e) => showSubmenHandler(e)}>
                                                        {subCat.children.length !== 0 && <span className="menu-expand"></span>}
                                                        <Link href={`/search?q=${subCat.slug}&type=cat`}>
                                                            <a><span className="menu-text">{subCat.name}</span></a>
                                                        </Link>
                                                        {subCat.children.length !== 0 &&
                                                            <ul className="offcanvas-submenu">
                                                                {subCat.children.map(subSubCat => (
                                                                    <li key={subSubCat._id}>
                                                                        <Link href={`/search?q=${subSubCat.slug}&type=cat`}>
                                                                            <a>{subSubCat.name}</a>
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        }
                                                    </li>
                                                ))}
                                            </ul>
                                        }
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    }
                </div>
            </div>
        </>
    );
}

export default MobileMenuDrawer;
