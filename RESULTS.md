# K6 lab results

## Part 0
- Step 0.1, http_req_duration: 391.38 ms (1 request, so avg = min = max = p(95))
- Step 0.2, requests, rate and p(95), and why the rate stays below 5:- Step 0.2, requests, rate and p(95), and why the rate stays below 5: 74 requests, 3.59 req/s, p(95) = 379.56 ms. Each VU sends one request, waits for the answer (~0.32 s avg), then sleeps 1 s, so one iteration takes ~1.39 s. One VU therefore makes about 1/1.39 ≈ 0.72 req/s, and 5 VUs make about 3.6 req/s, below 5.
- Step 0.6, exit code of the normal run and of the run with P95=300: Normal run (p(95) < 1500 ms) passed all thresholds, exit code 0. With P95=300 the p(95) rule failed (measured p(95) = 393.38 ms > 300 ms), the other two rules passed, and K6 exited with code 99. A CI pipeline would read the 99 and fail the build.
- Step 0.7, rules that passed, p(95), p(99), exit code after your change: With the requirement as given (3 VUs, 30 s, p(95)<1000, p(99)<1500, failure rate <1%), all three rules passed: p(95) = ___ ms, p(99) = ___ ms, failure rate = ___%. Exit code 0. I then changed the p(95) limit from 1000 ms to 200 ms; the p(95) rule failed (p(95) = ___ ms > 200 ms) while the other rules still passed, and the exit code was 99.
- Step 0.8, what was wrong, and how the checks showed it:

## Part A results
| Step | Test type    | Users | Req/s | p(95) | Max | Failed | Checks |
| ---- | ------------ | ----- | ----- | ----- | --- | ------ | ------ |
| A1   | Smoke        | 1     |       |       |     |        |        |
| A2   | Average load | 3     |       |       |     |        |        |
| A3   | Stress       | 5     |       |       |     |        |        |
| A4   | Spike        | 5     |       |       |     |        |        |
| A5   | Soak         | 2     |       |       |     |        |        |

## Part B
1.
2.
3.
4.
5.
6.
7.
8.
9.