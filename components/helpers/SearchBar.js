import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { parseCookies, destroyCookie } from 'nookies';

import { AutoComplete } from 'antd';

import axiosApi from '../../helpers/api';
import { Search, XCircle } from 'react-feather';

const SearchBar = ({ screen, searchInputClass, searchBtnClass, searchDropdown }) => {
    const [options, setOptions] = useState([]);
    const [closeDropdownAtSmallScreen, setCloseDropdownAtSmallScreen] = useState(false);

    const [destoryCookieAction, setDestoryCookieAction] = useState(false);

    const router = useRouter();

    const { searchTagHistory } = parseCookies();
    const parseSearchTagHistory = searchTagHistory ? JSON.parse(searchTagHistory) : [];

    const clearSearchTagHistory = () => {
        destroyCookie(null, "searchTagHistory");
        setDestoryCookieAction(true);
        // empty option and hide view history after clean cookie
        setOptions([]);
    }

    const renderTitle = (title) => (
        <div className="d-flex justify-content-between">
            {title}
            <a className="text-right text-info" onClick={clearSearchTagHistory}>
                Clear
            </a>
        </div>
    );
    const renderItem = (title, count) => ({
        value: title,
        label: title
    });

    const handleSearch = async (value) => {
        setCloseDropdownAtSmallScreen(true);

        const { data } = await axiosApi.post("/api/search/filter", {
            searchtext: value
        });

        let serachProduct = [];
        data.map(product => {
            const productObj = new Object;
            productObj['value'] = product.tag;
            serachProduct.push(productObj);
        });
        setOptions(serachProduct);
    };

    const onSelect = (value) => {
        router.push('/search?q=' + value + '&type=search')
    };

    const handleSearchHistory = () => {
        if (!destoryCookieAction && parseSearchTagHistory.length !== 0) {
            setOptions([
                {
                    label: renderTitle("View History"),
                    options: parseSearchTagHistory.map(tag => renderItem(tag))
                }
            ]);
        }
    }

    return (
        <div className="position-relative">
            <AutoComplete
                options={options}
                onSelect={onSelect}
                onSearch={handleSearch}
                onFocus={() => setCloseDropdownAtSmallScreen(true)}
                onDropdownVisibleChange={screen === 'large' && handleSearchHistory}
                className={`${searchInputClass}`}
                dropdownClassName={searchDropdown}
                backfill={true}
            >
                <input
                    name="q"
                    type="search"
                    placeholder="Search"
                    style={{
                        width: '100%',
                        height: '3rem',
                        outline: 'none',
                        border: 'none',
                        boxShadow: 'none',
                        backgroundColor: 'transparent',
                        marginTop: '0.5rem',
                        paddingLeft: screen === 'large' ? '1.9rem' : '2.5rem'
                    }}
                />
            </AutoComplete>
            <button className={`btn ${searchBtnClass}`} >
                <Search />
            </button>
            {closeDropdownAtSmallScreen && screen === "small" &&
                <div className="close-dropdown" onClick={() => setCloseDropdownAtSmallScreen(false)}>
                    <XCircle className="cp" />
                </div>
            }
        </div>
    );
};

export default React.memo(SearchBar);