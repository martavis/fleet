import React from "react";
import { Link } from "react-router";
import ReactTooltip from "react-tooltip";
import { isEmpty } from "lodash";

// TODO: Enable after backend has been updated to provide last_opened_at
// import distanceInWordsToNow from "date-fns/distance_in_words_to_now";

import { ISoftware } from "interfaces/software";

import PATHS from "router/paths";
import HeaderCell from "components/TableContainer/DataTable/HeaderCell/HeaderCell";
import TextCell from "components/TableContainer/DataTable/TextCell";
import TooltipWrapper from "components/TooltipWrapper";
import IssueIcon from "../../../../../../assets/images/icon-issue-fleet-black-50-16x16@2x.png";
import Chevron from "../../../../../../assets/images/icon-chevron-right-9x6@2x.png";

interface IHeaderProps {
  column: {
    title: string;
    isSortedDesc: boolean;
  };
}
interface ICellProps {
  cell: {
    value: string;
  };
  row: {
    original: ISoftware;
  };
}

interface IDataColumn {
  title: string;
  Header: ((props: IHeaderProps) => JSX.Element) | string;
  accessor: string;
  Cell: (props: ICellProps) => JSX.Element;
  disableHidden?: boolean;
  disableSortBy?: boolean;
  sortType?: string;
  // Filter can be used by react-table to render a filter input inside the column header
  Filter?: () => null | JSX.Element;
  filter?: string; // one of the enumerated `filterTypes` for react-table
  // (see https://github.com/tannerlinsley/react-table/blob/master/src/filterTypes.js)
  // or one of the custom `filterTypes` defined for the `useTable` instance (see `DataTable`)
}

const TYPE_CONVERSION: Record<string, string> = {
  apt_sources: "Package (APT)",
  deb_packages: "Package (deb)",
  portage_packages: "Package (Portage)",
  rpm_packages: "Package (RPM)",
  yum_sources: "Package (YUM)",
  npm_packages: "Package (NPM)",
  atom_packages: "Package (Atom)",
  python_packages: "Package (Python)",
  apps: "Application (macOS)",
  chrome_extensions: "Browser plugin (Chrome)",
  firefox_addons: "Browser plugin (Firefox)",
  safari_extensions: "Browser plugin (Safari)",
  homebrew_packages: "Package (Homebrew)",
  programs: "Program (Windows)",
  ie_extensions: "Browser plugin (IE)",
  chocolatey_packages: "Package (Chocolatey)",
  pkg_packages: "Package (pkg)",
};

const formatSoftwareType = (source: string) => {
  const DICT = TYPE_CONVERSION;
  return DICT[source] || "Unknown";
};

// NOTE: cellProps come from react-table
// more info here https://react-table.tanstack.com/docs/api/useTable#cell-properties
const generateSoftwareTableHeaders = (deviceUser = false): IDataColumn[] => {
  const tableHeaders: IDataColumn[] = [
    {
      title: "Vulnerabilities",
      Header: "",
      disableSortBy: true,
      accessor: "vulnerabilities",
      Filter: () => null, // input for this column filter outside of column header
      filter: "hasLength", // filters out rows where vulnerabilities has no length if filter value is `true`
      Cell: (cellProps) => {
        const vulnerabilities = cellProps.cell.value;
        if (isEmpty(vulnerabilities)) {
          return <></>;
        }
        return (
          <>
            <span
              className={`vulnerabilities tooltip__tooltip-icon`}
              data-tip
              data-for={`vulnerabilities__${cellProps.row.original.id.toString()}`}
              data-tip-disable={false}
            >
              <img alt="software vulnerabilities" src={IssueIcon} />
            </span>
            <ReactTooltip
              place="bottom"
              type="dark"
              effect="solid"
              backgroundColor="#3e4771"
              id={`vulnerabilities__${cellProps.row.original.id.toString()}`}
              data-html
            >
              <span className={`vulnerabilities tooltip__tooltip-text`}>
                {vulnerabilities.length === 1
                  ? "1 vulnerability detected"
                  : `${vulnerabilities.length} vulnerabilities detected`}
              </span>
            </ReactTooltip>
          </>
        );
      },
    },
    {
      title: "Name",
      Header: (cellProps) => (
        <HeaderCell
          value={cellProps.column.title}
          isSortedDesc={cellProps.column.isSortedDesc}
        />
      ),
      accessor: "name",
      Filter: () => null, // input for this column filter is rendered outside of column header
      filter: "text", // filters name text based on the user's search query
      Cell: (cellProps) => {
        const { name, bundle_identifier } = cellProps.row.original;
        if (bundle_identifier) {
          return (
            <span className="name-container">
              <TooltipWrapper
                tipContent={`
                <span>
                  <b>Bundle identifier: </b>
                  <br />
                  ${bundle_identifier}
                </span>
              `}
              >
                {name}
              </TooltipWrapper>
            </span>
          );
        }
        return <TextCell value={name} />;
      },
      sortType: "caseInsensitive",
    },
    {
      title: "Type",
      Header: (cellProps) => (
        <HeaderCell
          value={cellProps.column.title}
          isSortedDesc={cellProps.column.isSortedDesc}
        />
      ),
      disableSortBy: false,
      accessor: "source",
      Cell: (cellProps) => (
        <TextCell value={cellProps.cell.value} formatter={formatSoftwareType} />
      ),
    },
    {
      title: "Installed version",
      Header: "Installed version",
      disableSortBy: true,
      accessor: "version",
      Cell: (cellProps) => <TextCell value={cellProps.cell.value} />,
    },
    // TODO: Enable after backend has been updated to provide last_opened_at
    // {
    //   title: "Last used",
    //   Header: (cellProps) => (
    //     <HeaderCell
    //       value={cellProps.column.title}
    //       isSortedDesc={cellProps.column.isSortedDesc}
    //     />
    //   ),
    //   accessor: "last_opened_at",
    //   Cell: (cellProps) => {
    //     const lastUsed = isNaN(Date.parse(cellProps.cell.value))
    //       ? "Unavailable"
    //       : `${distanceInWordsToNow(Date.parse(cellProps.cell.value))} ago`;
    //     return (
    //       <span
    //         className={
    //           lastUsed === "Unavailable"
    //             ? "software-last-used-muted"
    //             : "software-last-used"
    //         }
    //       >
    //         {lastUsed}
    //       </span>
    //     );
    //   },
    //   sortType: "dateStrings",
    // },
    {
      title: "",
      Header: "",
      disableSortBy: true,
      accessor: "linkToFilteredHosts",
      Cell: (cellProps) => {
        return (
          <Link
            to={`${
              PATHS.MANAGE_HOSTS
            }?software_id=${cellProps.row.original.id.toString()}`}
            className={`software-link`}
          >
            View all hosts{" "}
            <img alt="link to hosts filtered by software ID" src={Chevron} />
          </Link>
        );
      },
      disableHidden: true,
    },
  ];

  // Device user cannot view all hosts software
  if (deviceUser) {
    tableHeaders.pop();
  }

  return tableHeaders;
};

export default generateSoftwareTableHeaders;
