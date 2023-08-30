import {
    FormControl,
    MenuItem,
    Select
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import styled from '@emotion/styled';
import { FieldWrapper, Input } from './styling';
import { ErrorMessageComponent } from '../ErrorMessage';

type FineTuneModelProps = {
    serviceName: string;
};

export const FineTuneModel: React.FC<FineTuneModelProps> = ({
    serviceName
}) => {
    const { setFieldValue, values } = useFormikContext<any>();

    const getArg = (s3Bucket: String, dataSet: String) =>  {
        return `python3 agora_python_bot.py --s3_bucket=${s3Bucket} --data_set=${dataSet} --model=llama2`;
    }
    const getS3BucketVal = (arg: String) => {
        const regex = /--s3_bucket=([^ ]+)/;
        const match = arg.match(regex);
        return match ? match[1] : '';
    }
    const getDataSetVal = (arg: String) => {
        const regex = /--data_set=([^ ]+)/;
        const match = arg.match(regex);
        return match ? match[1] : '';
    }

    return (
        <FormWrapper className="p-2">
            <FormTitleTop className="font-medium">Data Set</FormTitleTop>
            <FormControlWrapper>
                <Field name={`sdl.services.${serviceName}.args.0`}>
                    {({ field }: { field: { value: string } }) => (
                        <Select 
                            value={getDataSetVal(field.value)}
                            onChange={(e) => setFieldValue(`sdl.services.${serviceName}.args.0`, getArg(getS3BucketVal(field.value), e.target.value))} 
                        >
                            <MenuItem value={'python_instructions'}>Python Code Instructions</MenuItem>
                            <MenuItem value={'medical_terms'} disabled>Wiki Medical Terms</MenuItem>
                            <MenuItem value={'medical_dialog'} disabled>Medical Dialog</MenuItem>
                        </Select>
                    )}
                </Field>
            </FormControlWrapper>
            <FormTitle className="font-medium">Hugging Face Token</FormTitle>
            <Field name={`sdl.services.${serviceName}.env.0`}>
                {({ field, meta }: any ) => (
                    <FieldWrapperImage>
                        <InputField
                            {...field}
                            error={meta?.error}
                            value={field.value.split('=')[1]}
                            onChange={({currentTarget}) => {
                                const name = field.value.split('=')[0];
                                const value = currentTarget.value;
                                setFieldValue(`sdl.services.${serviceName}.env.0`, `${name}=${value}`);
                            }}
                        />
                        {meta?.error && <ErrorMessageComponent>{meta?.error}</ErrorMessageComponent>}
                    </FieldWrapperImage>
                )}
            </Field>
            <FormTitle className="font-medium">S3 Bucket Name</FormTitle>
            <Field name={`sdl.services.${serviceName}.args.0`}>
                {({ field }: { field: { value: string } }) => (
                    <FieldWrapperImage>
                        <InputField
                            {...field}
                            value={getS3BucketVal(field.value)}
                            onChange={({currentTarget}) => {
                                setFieldValue(`sdl.services.${serviceName}.args.0`, getArg(currentTarget.value, getDataSetVal(field.value)));
                            }}
                        />
                    </FieldWrapperImage>
                    
                )}
              </Field>
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
