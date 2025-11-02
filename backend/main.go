package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var minioClient *minio.Client

func main() {
	e := echo.New()

	// CORS middleware
	e.Use(middleware.CORS())

	// Initialize Minio client
	var err error
	minioClient, err = minio.New("minio:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("minioadmin", "minioadmin", ""),
		Secure: false,
	})
	if err != nil {
		fmt.Println("Failed to initialize Minio client:", err)
		os.Exit(1)
	}

	// Create bucket if not exists
	ctx := context.Background()
	bucketName := "uploads"
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		fmt.Println("Error checking bucket:", err)
		os.Exit(1)
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			fmt.Println("Error creating bucket:", err)
			os.Exit(1)
		}
		fmt.Printf("Successfully created bucket %s\n", bucketName)
	}

	// Health check endpoint
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// List uploads endpoint
	e.GET("/uploads", listUploads)

	// Download endpoint
	e.GET("/download/:filename", downloadFile)

	// Start server
	fmt.Println("Backend server starting on :8080")
	e.Logger.Fatal(e.Start(":8080"))
}

func listUploads(c echo.Context) error {
	ctx := context.Background()
	bucketName := "uploads"

	uploads := []map[string]string{}
	objectCh := minioClient.ListObjects(ctx, bucketName, minio.ListObjectsOptions{
		Recursive: true,
	})

	for object := range objectCh {
		if object.Err != nil {
			continue
		}
		uploads = append(uploads, map[string]string{
			"name": object.Key,
			"size": fmt.Sprintf("%d", object.Size),
		})
	}

	return c.JSON(200, uploads)
}

func downloadFile(c echo.Context) error {
	filename := c.Param("filename")
	ctx := context.Background()
	bucketName := "uploads"

	object, err := minioClient.GetObject(ctx, bucketName, filename, minio.GetObjectOptions{})
	if err != nil {
		return c.JSON(404, map[string]string{"error": "File not found"})
	}
	defer object.Close()

	// Get object info
	objInfo, err := object.Stat()
	if err != nil {
		return c.JSON(404, map[string]string{"error": "File not found"})
	}

	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filepath.Base(filename)))
	c.Response().Header().Set("Content-Length", fmt.Sprintf("%d", objInfo.Size))

	_, err = io.Copy(c.Response().Writer, object)
	return err
}
