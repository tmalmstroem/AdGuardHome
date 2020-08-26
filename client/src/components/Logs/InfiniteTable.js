import React, {
    useEffect,
    useRef,
    useState,
    forwardRef,
} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import throttle from 'lodash/throttle';
import Loading from '../ui/Loading';
import Header from './Cells/Header';
import { getLogs } from '../../actions/queryLogs';
import { QUERY_LOGS_PAGE_LIMIT, QUERY_LOGS_PAGE_SIZE } from '../../helpers/constants';

const InfiniteTable = ({
    isLoading,
    renderRow,
    items,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const firstElementRef = useRef(null);
    const [renderLimitIdx, setRenderLimitIdx] = useState(QUERY_LOGS_PAGE_SIZE);
    const pageYOffset = useRef(window.pageYOffset);

    const {
        isEntireLog,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);

    useEffect(() => {
        const THROTTLE_TIME = 50;
        const EVENT_TYPE = 'scroll';

        const listener = throttle(() => {
            pageYOffset.current = window.pageYOffset;
            if ((window.scrollY + window.innerHeight) === document.body.scrollHeight) {
                setRenderLimitIdx((idx) => idx + QUERY_LOGS_PAGE_SIZE);
                window.scrollTo(0, pageYOffset.current);

                const isDivisible = renderLimitIdx % QUERY_LOGS_PAGE_LIMIT === 0;

                if (isDivisible) {
                    dispatch(getLogs());
                }
            }
        }, THROTTLE_TIME);

        window.addEventListener(EVENT_TYPE, listener);
        return () => {
            window.removeEventListener(EVENT_TYPE, listener);
        };
    }, [renderLimitIdx]);

    const Row = forwardRef(({
        rowProps,
        style,
    }, ref) => renderRow({
        rowProps,
        style,
        ref,
    }));

    Row.displayName = 'Row';

    Row.propTypes = {
        rowProps: propTypes.object.isRequired,
        style: propTypes.object,
    };

    const getRow = (row, idx) => {
        const newStartElementIdx = renderLimitIdx - QUERY_LOGS_PAGE_SIZE;

        return <Row
                key={`${row.time} ${row.domain}`}
                rowProps={row}
                ref={idx === newStartElementIdx ? firstElementRef : null}
        />;
    };

    return <div className='logs__table' role='grid'>
        {(isLoading || processingGetLogs) && <Loading />}
        <Header />
        {items.length === 0 && !processingGetLogs
            ? <label className="logs__no-data">{t('nothing_found')}</label>
            : <>{items.slice(0, renderLimitIdx).map(getRow)}
                    {items.length > 0 && !isEntireLog
                    && <div className="text-center">{t('loading_table_status')}</div>}
            </>}
    </div>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    renderRow: propTypes.func.isRequired,
    items: propTypes.array.isRequired,
};

export default InfiniteTable;
