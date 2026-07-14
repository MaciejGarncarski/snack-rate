FROM alpine:3.24

RUN apk add --no-cache \
  postgresql18-client \
  rclone \
  bash

COPY tools/backup-tool/scripts/backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

ENTRYPOINT ["/usr/local/bin/backup.sh"]
