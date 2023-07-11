import boto3

def get_aws_parameters(store, params):
    session = boto3.Session()
    client = boto3.client('ssm', region_name='eu-west-1')
    response = client.get_parameters(Names=params, WithDecryption=True)
    for n in range(len(response['Parameters'])):
        store[response['Parameters'][n]['Name']] = response['Parameters'][n]['Value']

    response = client.get_parameters(Names=[
        'SPOTIFY_CLIENT_ID',
        'SPOTIFY_CLIENT_SECRET',
        'SPOTIFY_REDIRECT_URI',
        ], WithDecryption=True)
    for n in range(len(response['Parameters'])):
        store[response['Parameters'][n]['Name']] = response['Parameters'][n]['Value']