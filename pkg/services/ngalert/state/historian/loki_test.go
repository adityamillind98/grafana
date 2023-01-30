package historian

import (
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/stretchr/testify/require"
)

func TestMerge(t *testing.T) {
	testCases := []struct {
		name          string
		res           QueryRes
		ruleID        string
		expectedTime  []time.Time
		expectedState []string
	}{
		{
			name: "Should return values from multiple streams in right order",
			res: QueryRes{
				Data: QueryData{
					Result: []Stream{
						{
							Stream: map[string]string{
								"current": "pending",
							},
							Values: [][2]string{
								{"1", `{"schemaVersion": 1, "previous": "normal", "current": "pending", "values":{"a": "b"}}`},
							},
						},
						{
							Stream: map[string]string{
								"current": "firing",
							},
							Values: [][2]string{
								{"2", `{"schemaVersion": 1, "previous": "pending", "current": "firing", "values":{"a": "b"}}`},
							},
						},
					},
				},
			},
			ruleID: "123456",
			expectedTime: []time.Time{
				time.Unix(1, 0),
				time.Unix(2, 0),
			},
			expectedState: []string{
				"pending",
				"firing",
			},
		},
		{
			name: "Should handle empty values",
			res: QueryRes{
				Data: QueryData{
					Result: []Stream{
						{
							Stream: map[string]string{
								"current": "normal",
							},
							Values: [][2]string{},
						},
					},
				},
			},
			ruleID:        "123456",
			expectedTime:  []time.Time{},
			expectedState: []string{},
		},
		{
			name: "Should handle multiple values in one stream",
			res: QueryRes{
				Data: QueryData{
					Result: []Stream{
						{
							Stream: map[string]string{
								"current": "normal",
							},
							Values: [][2]string{
								{"1", `{"schemaVersion": 1, "previous": "firing", "current": "normal", "values":{"a": "b"}}`},
								{"2", `{"schemaVersion": 1, "previous": "firing", "current": "normal", "values":{"a": "b"}}`},
							},
						},
						{
							Stream: map[string]string{
								"current": "firing",
							},
							Values: [][2]string{
								{"3", `{"schemaVersion": 1, "previous": "pending", "current": "firing", "values":{"a": "b"}}`},
							},
						},
					},
				},
			},
			ruleID: "123456",
			expectedTime: []time.Time{
				time.Unix(1, 0),
				time.Unix(2, 0),
				time.Unix(3, 0),
			},
			expectedState: []string{
				"normal",
				"normal",
				"firing",
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			m, err := merge(tc.res, tc.ruleID)
			require.NoError(t, err)

			var (
				dfTimeColumn  *data.Field
				dfStateColumn *data.Field
			)
			for _, f := range m.Fields {
				if f.Name == dfTime {
					dfTimeColumn = f
				}
				if f.Name == dfNext {
					dfStateColumn = f
				}
			}

			require.NotNil(t, dfStateColumn)
			require.NotNil(t, dfTimeColumn)

			for i := 0; i < len(tc.expectedTime); i++ {
				require.Equal(t, tc.expectedTime[i], dfTimeColumn.At(i))
				require.Equal(t, tc.expectedState[i], dfStateColumn.At(i))
			}
		})
	}
}
