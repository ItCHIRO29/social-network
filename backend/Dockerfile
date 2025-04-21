FROM golang:1.23.7
WORKDIR /backend
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .
RUN chmod +x ./server
EXPOSE 8080
CMD ["./server"] 