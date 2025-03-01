package auth

import (
	"sync"
	"time"
)

type RateLimiter struct {
	LastTime    time.Time
	Rate        int
	Capacity    int
	Bucket      int
	LimiterTime time.Duration
}

type Limiters struct {
	sync.Map
}

func (l *Limiters) CleanupLimiters(timeout time.Duration) {
	for {
		time.Sleep(timeout)
		l.Range(func(key, value any) bool {
			limiter := value.(*RateLimiter)
			if time.Since(limiter.LastTime) >= timeout {
				l.Delete(key)
			}
			return true
		})
	}
}

func (l *Limiters) GetRateLimiter(userId int) (bool, *RateLimiter) {
	limiter, ok := l.Load(userId)
	if !ok {
		return false, nil
	}
	return true, limiter.(*RateLimiter)
}

func (l *Limiters) NewRateLimiter(userId, rate, capacity int, limiterTime time.Duration) *RateLimiter {
	limiter := RateLimiter{
		LastTime:    time.Now(),
		Rate:        rate,
		Capacity:    capacity,
		Bucket:      capacity,
		LimiterTime: limiterTime,
	}
	l.Store(userId, &limiter)
	return &limiter
}

func (r *RateLimiter) Allow() bool {
	if time.Since(r.LastTime) >= r.LimiterTime {
		duration := time.Since(r.LastTime).Seconds()
		r.LastTime = time.Now()
		r.Bucket = min(r.Bucket+(int(duration)*r.Rate), r.Capacity)
	}
	if r.Bucket > 0 {
		r.Bucket--
		return true
	}
	return false
}

func min(a int, b int) int {
	if a < b {
		return a
	}
	return b
}
