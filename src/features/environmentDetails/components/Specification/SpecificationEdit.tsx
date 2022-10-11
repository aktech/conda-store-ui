import React, { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import { cloneDeep } from "lodash";
import { stringify } from "yaml";
import { BlockContainerEditMode } from "../../../../components";
import { ChannelsEdit, updateChannels } from "../../../../features/channels";
import { Dependencies, pageChanged } from "../../../../features/dependencies";
import {
  modeChanged,
  EnvironmentDetailsModes
} from "../../../../features/environmentDetails";
import {
  RequestedPackagesEdit,
  updatePackages
} from "../../../../features/requestedPackages";
import { CodeEditor } from "../../../../features/yamlEditor";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { StyledButtonPrimary } from "../../../../styles";
import { CondaSpecificationPip } from "../../../../common/models";
import { requestedPackageParser } from "../../../../utils/helpers";
import { installedVersionsGenerated } from "../../environmentDetailsSlice";

export const SpecificationEdit = ({ onUpdateEnvironment }: any) => {
  const { channels } = useAppSelector(state => state.channels);
  const { requestedPackages, packageVersions } = useAppSelector(
    state => state.requestedPackages
  );
  const { dependencies, size, count, page } = useAppSelector(
    state => state.dependencies
  );
  const hasMore = size * page <= count;
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [code, setCode] = useState<{
    dependencies: (string | CondaSpecificationPip)[];
    channels: string[];
  }>({ dependencies: requestedPackages, channels });
  const initialChannels = useRef(cloneDeep(channels));
  const initialPackages = useRef(cloneDeep(requestedPackages));

  const onUpdateChannels = useCallback((channels: string[]) => {
    dispatch(updateChannels(channels));
  }, []);

  const onUpdateEditor = ({
    channels,
    dependencies
  }: {
    channels: string[];
    dependencies: string[];
  }) => {
    const code = { dependencies, channels };

    if (!channels || channels.length === 0) {
      code.channels = [];
    }

    if (!dependencies || dependencies.length === 0) {
      code.dependencies = [];
    }

    setCode(code);
  };

  const onToggleEditorView = (value: boolean) => {
    if (show) {
      dispatch(updatePackages(code.dependencies));
      dispatch(updateChannels(code.channels));
    } else {
      setCode({ dependencies: requestedPackages, channels });
    }

    setShow(value);
  };

  const onEditEnvironment = () => {
    const envContent = show
      ? code
      : { dependencies: requestedPackages, channels };

    onUpdateEnvironment(envContent);
  };

  const onCancelEdition = () => {
    dispatch(modeChanged(EnvironmentDetailsModes.READ));
    dispatch(updatePackages(initialPackages.current));
    dispatch(updateChannels(initialChannels.current));
  };

  useEffect(() => {
    const versions: { [key: string]: string } = {};

    requestedPackages.forEach(p => {
      if (typeof p === "string") {
        const { name, version } = requestedPackageParser(p as string);

        if (version) {
          versions[name] = version;
        }

        if (packageVersions[name]) {
          versions[name] = packageVersions[name];
        }
      }
    });

    dispatch(installedVersionsGenerated(versions));

    return () => {
      dispatch(installedVersionsGenerated({}));
    };
  }, []);

  return (
    <BlockContainerEditMode
      title="Specification"
      onToggleEditMode={onToggleEditorView}
      isEditMode={show}
    >
      <Box sx={{ padding: "13px 19px" }}>
        {show ? (
          <CodeEditor
            code={stringify({ dependencies: requestedPackages, channels })}
            onChangeEditor={onUpdateEditor}
          />
        ) : (
          <>
            <Box sx={{ marginBottom: "30px" }}>
              <RequestedPackagesEdit packageList={requestedPackages} />
            </Box>
            <Box sx={{ marginBottom: "30px" }}>
              <Dependencies
                mode="edit"
                dependencies={dependencies}
                hasMore={hasMore}
                next={() => dispatch(pageChanged(page + 1))}
              />
            </Box>
            <Box sx={{ margiBottom: "30px" }}>
              <ChannelsEdit
                channelsList={channels}
                updateChannels={onUpdateChannels}
              />
            </Box>
          </>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "30px",
            marginBottom: "10px"
          }}
        >
          <StyledButtonPrimary
            sx={{ padding: "5px 60px" }}
            onClick={onCancelEdition}
          >
            Cancel
          </StyledButtonPrimary>
          <StyledButtonPrimary
            sx={{ padding: "5px 60px" }}
            onClick={onEditEnvironment}
          >
            Edit
          </StyledButtonPrimary>
        </Box>
      </Box>
    </BlockContainerEditMode>
  );
};
