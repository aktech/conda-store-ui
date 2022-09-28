import React, { useState, useEffect, useMemo, useReducer } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useTheme from "@mui/material/styles/useTheme";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import IconButton from "@mui/material/IconButton";
import { useLazyGetPackageVersionSuggestionsQuery } from "src/features/requestedPackages/requestedPackageVersionApiSlice";
import {
  ActionTypes,
  initialState,
  requestedPackagesReducer
} from "src/features/requestedPackages/reducer";
import { compareVersions } from "compare-versions";
interface IVersionSelectProps {
  /**
   * @param version package version
   * @param name package name
   */
  version: string | null;
  name: string;
  onUpdate?: (value: string) => void;
}

export const VersionSelect = ({
  version,
  name,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUpdate = (value: string) => {}
}: IVersionSelectProps) => {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);

  const [state, dispatch] = useReducer(requestedPackagesReducer, initialState);

  const [triggerQuery] = useLazyGetPackageVersionSuggestionsQuery();

  useEffect(() => {
    (async () => {
      dispatch({ type: ActionTypes.LOADING, payload: { loading: true } });
      const { data } = await triggerQuery({
        page: state.page,
        search: name.trim()
      });

      if (data) {
        dispatch({
          type: ActionTypes.DATA_FETCHED,
          payload: { data: data.data, count: data.count }
        });
      }
      dispatch({ type: ActionTypes.LOADING, payload: { loading: false } });
    })();
  }, []);

  const versionList = useMemo(() => {
    const uniqueVersions = new Set();
    const result: string[] = [];
    let sortedVersions: string[] = [];

    state.data.forEach(packageVersions => {
      const packageVersion = packageVersions.version.replace(/[^0-9.]+/, "");
      const hasPackageVersion = uniqueVersions.has(packageVersion);

      if (!hasPackageVersion) {
        result.push(packageVersion);
        uniqueVersions.add(packageVersion);
      }
    });
    sortedVersions = result.sort(compareVersions);
    return sortedVersions.reverse();
  }, [state.data]);

  return (
    <Select
      defaultValue={version ?? ""}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      onChange={e => onUpdate(e.target.value)}
      IconComponent={() => (
        <IconButton
          sx={{ padding: "0px" }}
          onClick={() => setOpen(currState => !currState)}
        >
          <ArrowDropDownIcon
            sx={{
              backgroundColor: "#ECECEC",
              height: "37px",
              borderLeft: `2px solid  ${palette.primary.main}`
            }}
          />
        </IconButton>
      )}
      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
      sx={{
        borderRadius: "0px",
        width: "110px",
        border: "none"
      }}
      inputProps={{
        sx: {
          padding: "7px 9px !important",
          backgroundColor: "#ECECEC",
          borderRadius: "0px"
        }
      }}
    >
      {versionList.map(v => (
        <MenuItem key={v} value={v}>
          {v}
        </MenuItem>
      ))}
    </Select>
  );
};
