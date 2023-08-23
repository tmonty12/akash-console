import {
    FormControl,
    MenuItem,
    Select
} from '@mui/material';
import styled from '@emotion/styled';
import { FieldWrapper, Input } from './styling';

export const FineTuneModel: React.FC = () => {
    return (
        <FormWrapper className="p-2">
            <FormTitleTop className="font-medium">Data Set</FormTitleTop>
            <FormControlWrapper>
                <Select>
                    <MenuItem value={'pythonInstructions'}>Python Code Instructions</MenuItem>
                    <MenuItem value={'medicalTerms'} disabled>Wiki Medical Terms</MenuItem>
                    <MenuItem value={'medicalDialog'} disabled>Medical Dialog</MenuItem>
                </Select>
            </FormControlWrapper>
            <FormTitle className="font-medium">Hugging Face Token</FormTitle>
            <FieldWrapperImage>
                <InputField type="text"/>
            </FieldWrapperImage>
        </FormWrapper>
    );
}

const FormControlWrapper = styled(FormControl)`
    width: 50%;
`

const FormTitleTop = styled.h1`
    padding: 0px 10px 10px;
`

const FormTitle = styled.h1`
    padding: 10px;
`

const FormWrapper = styled.div`
  box-shadow: none;
  background-color: #ffff;
  padding: 0px 16px 16px;
`

const FieldWrapperImage = styled(FieldWrapper)`
  display: flex;
  align-items: start;
  flex-direction: column;
`;

const InputField = styled(Input)`
  border: 1px solid #d7d7d7;
  width: 50%;

  &:disabled {
    background-color: #d7d7d73d;
    pointer-events: none;
  }
`;
