Setps for Local setup:

- Create AWS S3 bucket:
    - Open AWS console and choose s3. 
    - Click on Create new bucket
    - Set the bucket name (we named it udagram-monolith-to-microservices) and make sure 
    that you check all public access to the bucket.
    - After the bucket is created, select the bucket from the bucket list then go "Permissions". 
    - From there, edit the Bucket policy to allow read, write and delete from the bucket by adding the following
    ```
    {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3AccessPolicy",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::udagram-monolith-to-microservices/*"
        },
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::udagram-monolith-to-microservices"
        }
    ]
    }
    ```

- In order for us to run our application locally against the S3 bucket, 
we will need to set up the CORS configuration for the S3 bucket. 
Select the bucket from the bucket list and click on "Permissions". 
From there, edit the Bucket CORS configuration by adding the following
```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "POST",
            "GET",
            "DELETE",
            "PUT"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

Note: It’s recommended that once you’re done developing locally and have the application running in AWS, 
you should trim down on the permissions to restrict access.


- make sure node and npm are installed.

- create and run postgres container instance using the following command 
`docker run  --rm --name udagram-postgres -p 5432:5432 -e POSTGRES_PASSWORD=password -d postgres`
after that you can check your database connection by connecting to the container or with any GUI tool like Postbird
for more details on settings up postgres on docker, check [this tutorial](https://www.optimadata.nl/blogs/1/n8dyr5-how-to-run-postgres-on-docker-part-1)

- Open set_env.sh and set every values for the crosspodning values of your local setup 
then run the following command in your terminal `source set_env.sh`

- continue from current readme to include how to run frondend and backend.

