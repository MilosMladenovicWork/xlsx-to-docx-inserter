import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
} from "@material-ui/core";

import Section from "../screens/components/Section";
import ValidationWrapper from "../screens/components/ValidationWrapper";
import { StatusType } from "../screens/Convert";

export interface ChooseTemplateProps {
  handleSelectedTemplate: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => void;
  selectedTemplate: string;
  uploadedTemplates: string[];
  isOpen: boolean;
  title: string;
  selectedTemplateStatuses: StatusType[];
}

const useStyles = makeStyles(
  (theme) => ({
    listTitle: { color: theme.palette.text.primary },
    formControl: {
      minWidth: 120,
    },
  }),
  { name: "ChooseTemplate" }
);

const ChooseTemplate = ({
  handleSelectedTemplate,
  selectedTemplate,
  uploadedTemplates,
  selectedTemplateStatuses,
  title,
  isOpen,
}: ChooseTemplateProps) => {
  const classes = useStyles();

  const chooseTemplateValid = () => {
    if (selectedTemplateStatuses && selectedTemplateStatuses.length > 0) {
      if (selectedTemplateStatuses.some((status) => status.valid === false)) {
        return "error";
      }
      if (
        selectedTemplateStatuses.some((status) => status.valid === "warning")
      ) {
        return "warning";
      }
      if (selectedTemplateStatuses.every((status) => status.valid === true)) {
        return "success";
      }
    } else return "neutral";
  };

  return (
    <Section isOpen={isOpen} title={title}>
      <ValidationWrapper isValid={chooseTemplateValid()}>
        <FormControl className={classes.formControl}>
          <InputLabel>Template</InputLabel>
          <Select onChange={handleSelectedTemplate} value={selectedTemplate}>
            {uploadedTemplates.map((template) => (
              <MenuItem value={template} key={template}>
                {template}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ValidationWrapper>
    </Section>
  );
};

export default ChooseTemplate;
