import {
    FormControl,
    MenuItem,
    Select
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import styled from '@emotion/styled';
import { FieldWrapper, Input } from './styling';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { String } from 'lodash';

type FineTuneModelProps = {
    serviceName: string;
};

export const FineTuneModel: React.FC<FineTuneModelProps> = ({
    serviceName
}) => {
    const [ jobId, setJobId ] = React.useState<String>('');
    const { setFieldValue, values } = useFormikContext<any>();

    React.useEffect(() => {
        if (jobId == '') {
            setJobId(uuidv4());
        }
    }, [])

    const getArg = (s3Bucket: String, dataSet: String, model: String) =>  {
        return `python3 agora_python_bot.py --bucket_name ${s3Bucket} --hf_data_path ${dataSet} --model_name ${model} --jobId ${jobId}`;
    }
    const getS3BucketVal = (arg: String) => {
        const regex = /--bucket_name ([^ ]+)/;
        const match = arg.match(regex);
        return match ? match[1] : '';
    }
    const getDataSetVal = (arg: String) => {
        const regex = /--hf_data_path ([^ ]+)/;
        const match = arg.match(regex);
        return match ? match[1] : '';
    }
    const getModelVal= (arg: String) => {
        const regex = /--model_name ([^ ]+)/;
        const match = arg.match(regex);
        return match ? match[1] : '';
    }

    return (
        <FormWrapper className="p-2">
            <FormTitleTop className="font-medium">Model</FormTitleTop>
            <FormControlWrapper style={{ marginBottom: '10px'}}>
                <Field name={`sdl.services.${serviceName}.args.0`}>
                    {({ field }: { field: { value: string } }) => (
                        <Select 
                            value={getModelVal(field.value)}
                            onChange={(e) => setFieldValue(`sdl.services.${serviceName}.args.0`, getArg(getS3BucketVal(field.value), getDataSetVal(field.value), e.target.value))} 
                        >
                            <MenuItem value={'meta-llama/Llama-2-7b-hf'}>LLaMa2 7B</MenuItem>
                            <MenuItem value={'falcon180b'} disabled>Falcon 180B</MenuItem>
                            <MenuItem value={'python34b'} disabled>Python 34B</MenuItem>
                        </Select>
                    )}
                </Field>
            </FormControlWrapper>
            <FormTitleTop className="font-medium">Data Set</FormTitleTop>
            <FormControlWrapper>
                <Field name={`sdl.services.${serviceName}.args.0`}>
                    {({ field }: { field: { value: string } }) => (
                        <Select 
                            value={getDataSetVal(field.value)}
                            onChange={(e) => setFieldValue(`sdl.services.${serviceName}.args.0`, getArg(getS3BucketVal(field.value), e.target.value, getModelVal(field.value)))} 
                        >
                            <MenuItem value={'iamtarun/python_code_instructions_18k_alpaca'}>Python Code Instructions</MenuItem>
                            <MenuItem value={'medical_terms'} disabled>Wiki Medical Terms</MenuItem>
                            <MenuItem value={'medical_dialog'} disabled>Medical Dialog</MenuItem>
                        </Select>
                    )}
                </Field>
            </FormControlWrapper>
            <FormTitle className="font-medium">Storj Bucket Name</FormTitle>
            <Field name={`sdl.services.${serviceName}.args.0`}>
                {({ field }: { field: { value: string } }) => (
                    <FieldWrapperImage>
                        <InputField
                            {...field}
                            value={getS3BucketVal(field.value)}
                            onChange={({currentTarget}) => {
                                setFieldValue(`sdl.services.${serviceName}.args.0`, getArg(currentTarget.value, getDataSetVal(field.value), getModelVal(field.value)));
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
