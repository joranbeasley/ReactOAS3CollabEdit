## Using the AWS Backend

### Setup AWS CLI
1. [Install aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
By following the directions for your OS found in the [Documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)


2. set your credentials that will allow you to deploy the stack, either in `~/.aws/credentials`
```editorconfig
[default]
aws_access_key_id=AKIAIOSFODNN7EXAMPLE
aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```
or using [environmental variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) 
```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7-EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY-EXAMPLEKEY
export AWS_DEFAULT_REGION=us-west-2
```

3. install *serverless* `npm install -g serverless`  
4. deploy the stack with `serverless deploy` from the root directory
