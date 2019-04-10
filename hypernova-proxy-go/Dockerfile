FROM golang:1.8

WORKDIR /go/src/app
COPY . .

RUN go get -d -v ./...
RUN go install -v ./...

ENV HYPERNOVA_BATCH=http://hypernova:3000/batch
ENV HYPERNOVA_HOST=http://hypernova:3000
ENV BLOG_HOST=http://blog:8000

CMD ["app"]