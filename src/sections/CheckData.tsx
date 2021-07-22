import {
  Button,
  Grid,
  makeStyles,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Input,
} from "@material-ui/core";

import { Publish } from "@material-ui/icons";
import ValidationWrapper from "../screens/components/ValidationWrapper";
import Section from "../screens/components/Section";
import { StatusType } from '../screens/Convert';

export interface CheckDataProps {
  cellRegexes: { id?: string; regex?: string; colNum: number | undefined }[];
  handleColumnSelection: (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => void;
  xlsxColumnNames: { name: string; colNum: number }[];
  checkingXLSXColumns: boolean;
  handleCheckXLSXColumns: () => Promise<void>;
  setCellRegexes: React.Dispatch<
    React.SetStateAction<
      {
        id?: string | undefined;
        regex?: string | undefined;
        colNum: number | undefined;
      }[]
    >
  >;
  checkXLSXColumnsStatuses: StatusType[];
  isOpen: boolean;
}

const useStyles = makeStyles(
  () => ({
    formControl: {
      minWidth: 160,
    },
    select: {
      paddingLeft: 10,
    },
  }),
  { name: "Convert" }
);

const CheckData = ({
  cellRegexes,
  checkXLSXColumnsStatuses,
  handleColumnSelection,
  xlsxColumnNames,
  checkingXLSXColumns,
  handleCheckXLSXColumns,
  setCellRegexes,
  isOpen,
}: CheckDataProps) => {
  const classes = useStyles();

  const handleRegexInput: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const targetName = e.target.name as string;
    const targetValue = e.target.value;
    const stateIndex = cellRegexes.findIndex((item) => item.id === targetName);
    if (stateIndex !== -1) {
      setCellRegexes((prevState) => {
        const newState = [...prevState];
        newState[stateIndex].regex = targetValue;
        return newState;
      });
      if (e.target.value === "" && cellRegexes.length > 1) {
        setCellRegexes((prevState) => {
          const newState = [...prevState];
          return newState.filter((item) => item.id !== targetName);
        });
      }
      if (cellRegexes.every((item) => item.regex)) {
        setCellRegexes((prevState) => {
          const newState = [...prevState];
          newState.push({ id: undefined, colNum: undefined, regex: undefined });
          return newState;
        });
      }
    } else {
      setCellRegexes((prevState) => {
        const newState = [...prevState];
        const stateIndex = cellRegexes.findIndex(
          (item) => item.id === undefined
        );
        newState[stateIndex].id = targetName;
        return newState;
      });
    }
  };

  const checkDataValid = () => {
    const statuseValidArray = checkXLSXColumnsStatuses.map(status => status.valid);
    const hasFalseStatus = statuseValidArray.some(item => item === false);

    if (hasFalseStatus) return 'error';
    else if (!hasFalseStatus) return 'success';
    else return 'neutral';
  }

  return (
    <Section isOpen={isOpen}>
      <Grid container item spacing={2}>
        <Grid item>
          <Typography>
            Select column and insert regex to check if data is all right
          </Typography>
        </Grid>
        {cellRegexes.map((_data, index) => {
          return (
            <Grid container item spacing={2} key={index}>
              <Grid item>
                <FormControl key={index} className={classes.formControl}>
                  <InputLabel>Check column</InputLabel>
                  <Select
                    onChange={handleColumnSelection}
                    name={`regexes${index}`}
                    classes={{
                      root: classes.select,
                    }}
                  >
                    {xlsxColumnNames &&
                      xlsxColumnNames.length > 0 &&
                      xlsxColumnNames.map(({ name, colNum }) => (
                        <MenuItem value={colNum} key={colNum}>
                          {name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl key={index} className={classes.formControl}>
                  <InputLabel>With regex</InputLabel>
                  <Input name={`regexes${index}`} onChange={handleRegexInput} />
                </FormControl>
              </Grid>
            </Grid>
          );
        })}
        <Grid item>
          {/* TODO: add logic to this button */}
          <ValidationWrapper isValid={checkDataValid()}>
            <Button
              variant="contained"
              color="secondary"
              component="label"
              startIcon={<Publish />}
              disabled={checkingXLSXColumns}
              onClick={handleCheckXLSXColumns}
            >
              Check columns
            </Button>
          </ValidationWrapper>
        </Grid>
      </Grid>
    </Section>
  );
};

export default CheckData;
