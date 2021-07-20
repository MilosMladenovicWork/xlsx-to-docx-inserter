import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
} from "@material-ui/core";

import Section from "../screens/components/Section";

export interface ChooseTemplateProps {
  handleSelectedTemplate: (event: React.ChangeEvent<{
    name?: string | undefined;
    value: unknown;
}>) => void;
  selectedTemplate: unknown;
  uploadedTemplates: string[];
  isOpen: boolean;
  title: string;
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
  title,
  isOpen,
}: ChooseTemplateProps) => {
  const classes = useStyles();
  return (
    <Section isOpen={isOpen} title={title}>
    <FormControl className={classes.formControl}>
      <InputLabel>Template</InputLabel>
      <Select
        onChange={handleSelectedTemplate}
        value={selectedTemplate}
      >
        {uploadedTemplates.map((template) => (
          <MenuItem value={template} key={template}>
            {template}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Section>
  );
};

export default ChooseTemplate;
