import React from "react";

import SquareIcon from "@mui/icons-material/Square";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import requestedPackageParser from "src/utils/helpers/requestedPackageParser";
import toUpperCase from "src/utils/helpers/toUpperCase";

interface IRequestedPackageProps {
  requestedPackage: string;
}

const RequestedPackage = ({ requestedPackage }: IRequestedPackageProps) => {
  const { name, version, constraint } =
    requestedPackageParser(requestedPackage);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
        <SquareIcon
          sx={{ color: "#000", width: 10, height: 10, marginRight: "12px" }}
        />
        <Typography sx={{ width: 170 }}>
          {toUpperCase(name)} {version}
        </Typography>
      </Box>
      <Typography>
        {constraint} {version}
      </Typography>
    </Box>
  );
};

export default RequestedPackage;
