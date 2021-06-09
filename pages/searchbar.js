import React from 'react';
import { useRouter } from 'next/router';

import { ArrowLeft } from 'react-feather'
import { Tag } from 'antd';

import SearchBar from '../components/helpers/SearchBar';

// css
import styles from '../styles/Header.module.css';

const search = () => {
    const router = useRouter();
    const handleSearchSubmit = e => {
        e.preventDefault()
        const { q } = e.target.elements
        const searchedQueryValue = q.value;

        const trimSearchedQueryValue = searchedQueryValue.trim();

        if (trimSearchedQueryValue === " ") {
            router.push('/search?q=' + trimSearchedQueryValue);
        } else {
            router.reload();
        }
    }
    return (
        <div className="container-fluid bg-white" style={{ height: '100vh' }}>
            <div className="d-block">
                <div className={`cp ${styles.search_backBtn}`} onClick={() => router.back()}>
                    <ArrowLeft />
                </div>
                <div className={styles.search}>
                    <form onSubmit={handleSearchSubmit} className="form-inline position-relative">
                        <SearchBar
                            screen="small"
                            searchInputClass={styles.search_searchProduct}
                            searchBtnClass={styles.search_searchBtn}
                            searchDropdown="search-custom-dropdown"
                        />
                    </form>
                </div>
            </div>
            <div className="d-block mt-5">
                <div className="d-flex justify-content-between font14">
                    <div className="text-muted">Search History</div>
                    <div className="cp text-info font13">Clear</div>
                </div>
                <div className="d-block">
                    <Tag className="mt-3">Tag 1</Tag>
                    <Tag className="mt-3">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                    <Tag className="mt-2">Tag 1</Tag>
                </div>
            </div>
        </div>
    );
}

export default search;
