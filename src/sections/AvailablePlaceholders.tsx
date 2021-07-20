import { Grid, Chip, Typography } from "@material-ui/core";
import Section from "../screens/components/Section";

export interface AvailablePlaceholdersProps {
  docxPlaceholders: string[];
  isOpen: boolean;
}

const AvailablePlaceholders = ({
  docxPlaceholders,
  isOpen,
}: AvailablePlaceholdersProps) => {
  return (
    <Section isOpen={isOpen} hasDivider={false}>
      <Grid container item spacing={1}>
        <Grid item>
          <Typography>Available placeholders</Typography>
        </Grid>
        <Grid container item spacing={1}>
          {docxPlaceholders &&
            docxPlaceholders.length > 0 &&
            docxPlaceholders.map((placeholder) => (
              <Grid item>
                <Chip
                  // avatar={<Avatar>{colNum}</Avatar>}
                  label={placeholder}
                  color={"primary"}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Section>
  );
};

export default AvailablePlaceholders;
