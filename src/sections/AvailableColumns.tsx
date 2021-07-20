import { Grid, Avatar, Chip, Typography } from "@material-ui/core";
import Section from "../screens/components/Section";

export interface AvailableColumnsProps {
  xlsxColumnNames: { name: string; colNum: number }[];
  isOpen: boolean;
}

const AvailableColumns = ({
  xlsxColumnNames,
  isOpen,
}: AvailableColumnsProps) => {
  return (
    <Section isOpen={isOpen} hasDivider={false}>
      <Grid container item spacing={1}>
        <Grid item>
          <Typography>Available columns</Typography>
        </Grid>
        <Grid container item spacing={1}>
          {xlsxColumnNames &&
            xlsxColumnNames.length > 0 &&
            xlsxColumnNames.map(({ name, colNum }) => (
              <Grid item>
                <Chip
                  avatar={<Avatar>{colNum}</Avatar>}
                  label={name}
                  color={"primary"}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Section>
  );
};

export default AvailableColumns;
