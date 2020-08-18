import React, { useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import Loading from '../ui/Loading';
import Cells from './Cells';
import Header from './Cells/Header';
import { getLogs } from '../../actions/queryLogs';

// todo change hardcode
const CELL_HEIGHT = 50;
const DETAILED_CELL_HEIGHT = 80;
const WIDTH = 1176;
const HEIGHT = 1600;

const InfiniteTable = ({
    isLoading,
    isSmallScreen,
    setDetailedDataCurrent,
    setButtonType,
    setModalOpened,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const queryLogs = useSelector((state) => state.queryLogs, shallowEqual);
    const { allLogs } = queryLogs;

    const items = allLogs;

    const {
        isDetailed,
        processingGetLogs,
        oldest,
        page,
        total,
    } = useSelector((state) => state.queryLogs, shallowEqual);

    const loadMoreItems = () => {
        // todo handle last page
        dispatch(getLogs({
            older_than: oldest,
            page,
        }));
    };

    const getIsItemLoaded = (index) => index < items.length - 1;

    // todo test if this really produce optimization
    const Row = useCallback(Cells, [items]);

    return <InfiniteLoader
            isItemLoaded={getIsItemLoaded}
            itemCount={total}
            loadMoreItems={loadMoreItems}
    >
        {({ onItemsRendered, ref }) => <div className='logs__table'>
            {(isLoading || processingGetLogs) && <Loading />}
            <Header />
            {total === 0 && !processingGetLogs
                ? <label className="logs__no-data">{t('nothing_found')}</label>
                : <FixedSizeList
                            className="mw-100"
                            width={WIDTH}
                            height={HEIGHT}
                            itemCount={total}
                            itemSize={isDetailed ? DETAILED_CELL_HEIGHT : CELL_HEIGHT}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                    >
                        {({
                            index,
                            style,
                        }) => <Row
                                style={style}
                                item={items?.[index]}
                                isSmallScreen={isSmallScreen}
                                setDetailedDataCurrent={setDetailedDataCurrent}
                                setButtonType={setButtonType}
                                setModalOpened={setModalOpened}
                        />}
                    </FixedSizeList>}
        </div>}
    </InfiniteLoader>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    isSmallScreen: propTypes.bool.isRequired,
    setDetailedDataCurrent: propTypes.func.isRequired,
    setButtonType: propTypes.func.isRequired,
    setModalOpened: propTypes.func.isRequired,
};

export default InfiniteTable;
