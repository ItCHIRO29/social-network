package models

import "time"

type Notification struct {
	Id             int            `json:"id"`
	Sender         string         `json:"sender"`
	Receiver       string         `json:"receiver"`
	Type           string         `json:"notification_type"`
	ReferenceId    int            `json:"reference_id"`
	CreatedAt      time.Time      `json:"created_at"`
	Image          string         `json:"image"`
	AdditionalData map[string]any `json:"additional_data"`
}
