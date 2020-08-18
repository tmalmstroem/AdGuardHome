import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { checkFiltered } from '../../../helpers/helpers';
import { BLOCK_ACTIONS } from '../../../helpers/constants';
import { toggleBlocking } from '../../../actions';
import getIconTooltip from './getIconTooltip';
import { renderFormattedClientCell } from '../../../helpers/renderFormattedClientCell';

const ClientCell = ({
    client,
    domain,
    info,
    info: { name, whois_info },
    reason,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const autoClients = useSelector((state) => state.dashboard.autoClients, shallowEqual);
    const processingRules = useSelector((state) => state.filtering.processingRules);
    const isDetailed = useSelector((state) => state.queryLogs.isDetailed);

    const autoClient = autoClients.find((autoClient) => autoClient.name === client);
    const source = autoClient?.source;
    const whoisAvailable = whois_info && Object.keys(whois_info).length > 0;

    const id = nanoid();

    const data = {
        address: client,
        name,
        country: whois_info?.country,
        city: whois_info?.city,
        network: whois_info?.orgname,
        source_label: source,
    };

    const processedData = Object.entries(data);

    const isFiltered = checkFiltered(reason);

    const nameClass = classNames('w-90 o-hidden d-flex flex-column', {
        'mt-2': isDetailed && !name && !whoisAvailable,
        'white-space--nowrap': isDetailed,
    });

    const hintClass = classNames('icons mr-4 icon--24 icon--lightgray', {
        'my-3': isDetailed,
    });

    const renderBlockingButton = (isFiltered, domain) => {
        const buttonType = isFiltered ? BLOCK_ACTIONS.UNBLOCK : BLOCK_ACTIONS.BLOCK;

        const buttonClass = classNames('logs__cell--block-button button__action', {
            'btn-outline-secondary': isFiltered,
            'btn-outline-danger': !isFiltered,
            'logs__action--detailed': isDetailed,
        });

        const onClick = () => dispatch(toggleBlocking(buttonType, domain));

        return <div className={buttonClass}>
            <button
                    type="button"
                    className={classNames('btn btn-sm', buttonClass)}
                    onClick={onClick}
                    disabled={processingRules}
            >
                {t(buttonType)}
            </button>
        </div>;
    };

    return <div className="o-hidden h-100 logs__cell logs__cell--client">
        {getIconTooltip({
            className: hintClass,
            columnClass: 'grid grid--limited',
            tooltipClass: 'px-5 pb-5 pt-4 mw-75',
            xlinkHref: 'question',
            contentItemClass: 'text-truncate key-colon',
            title: 'client_details',
            content: processedData,
            placement: 'bottom',
        })}
        <div className={nameClass}>
            <div data-tip={true} data-for={id}>
                {renderFormattedClientCell(client, info, isDetailed, true)}
            </div>
            {isDetailed && name && !whoisAvailable
            && <div className="detailed-info d-none d-sm-block logs__text"
                    title={name}>
                {name}
            </div>}
        </div>
        {renderBlockingButton(isFiltered, domain)}
    </div>;
};

ClientCell.propTypes = {
    client: propTypes.string.isRequired,
    domain: propTypes.string.isRequired,
    info: propTypes.oneOfType([
        propTypes.string,
        propTypes.shape({
            name: propTypes.string.isRequired,
            whois_info: propTypes.shape({
                country: propTypes.string,
                city: propTypes.string,
                orgname: propTypes.string,
            }),
        }),
    ]),
    reason: propTypes.string.isRequired,
};

export default ClientCell;
